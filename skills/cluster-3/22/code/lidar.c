/*
 * lidar.c
 *
 * ESP-IDF driver helpers for Garmin LIDAR-Lite v4 LED over I2C.
 * Adapted from Garmin's LIDARLite_Arduino_Library (Apache-2.0).
 *
 * This file is intentionally a reusable module (no app_main) so it can run
 * alongside other sensors in the same firmware.
 */

#include <stdio.h>
#include <stdint.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"
#include "esp_err.h"
#include "lidar.h"

/* ── Bus configuration ────────────────────────────────────────────── */
#define I2C_MASTER_NUM          I2C_NUM_0
#define I2C_MASTER_TIMEOUT_MS   3000
#define LIDAR_READY_POLL_DELAY_MS 2
#define LIDAR_I2C_RETRIES       3
#define LIDAR_I2C_RETRY_DELAY_MS 4

/* ── LIDAR-Lite v4 LED constants ─────────────────────────────────── */
#define LIDAR_ADDR              0x62     /* 7-bit default I2C address    */

/* Registers (from Garmin datasheet / Arduino library) */
#define REG_ACQ_COMMAND         0x00     /* write 0x04 to start ranging  */
#define REG_STATUS              0x01     /* bit 0 = busy flag            */
#define REG_SIG_COUNT_VAL       0x05     /* max acquisition count        */
#define REG_ACQ_CONFIG          0xE5     /* acquisition config register  */
#define REG_DISTANCE_LOW        0x10     /* low byte of 16-bit result    */
/* high byte is at 0x11; we read both in a single 2-byte burst         */

#define ACQ_CMD_TAKE_RANGE      0x04
#define STATUS_BUSY_MASK        0x01

/* ─────────────────────────────────────────────────────────────────── */
/*  Low-level I2C helpers                                              */
/* ─────────────────────────────────────────────────────────────────── */

static esp_err_t lidar_cmd_begin_with_retry(i2c_cmd_handle_t cmd)
{
    esp_err_t ret = ESP_FAIL;
    for (int attempt = 0; attempt < LIDAR_I2C_RETRIES; ++attempt) {
        ret = i2c_master_cmd_begin(
            I2C_MASTER_NUM, cmd,
            pdMS_TO_TICKS(I2C_MASTER_TIMEOUT_MS));
        if (ret != ESP_ERR_TIMEOUT) {
            return ret;
        }
        vTaskDelay(pdMS_TO_TICKS(LIDAR_I2C_RETRY_DELAY_MS));
    }
    return ret;
}

/**
 * @brief Write one byte to a LIDAR register.
 */
static esp_err_t lidar_write_reg(uint8_t reg_addr, uint8_t data)
{
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();

    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (LIDAR_ADDR << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write_byte(cmd, reg_addr, true);
    i2c_master_write_byte(cmd, data, true);
    i2c_master_stop(cmd);

    esp_err_t ret = lidar_cmd_begin_with_retry(cmd);

    i2c_cmd_link_delete(cmd);
    return ret;
}

/**
 * @brief Read one or more bytes from a LIDAR register (auto-increment).
 *
 * The LIDAR's internal address pointer is set by writing the register
 * address first (no STOP between write and read — repeated start).
 */
static esp_err_t lidar_read_reg(uint8_t reg_addr,
                                uint8_t *data_out,
                                size_t   num_bytes)
{
    if (num_bytes == 0 || data_out == NULL) {
        return ESP_ERR_INVALID_ARG;
    }

    i2c_cmd_handle_t cmd = i2c_cmd_link_create();

    /* Write phase: set internal register pointer */
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (LIDAR_ADDR << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write_byte(cmd, reg_addr, true);

    /* Repeated START then read phase */
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (LIDAR_ADDR << 1) | I2C_MASTER_READ, true);
    if (num_bytes > 1) {
        i2c_master_read(cmd, data_out, num_bytes - 1, I2C_MASTER_ACK);
    }
    i2c_master_read_byte(cmd, data_out + num_bytes - 1, I2C_MASTER_NACK);
    i2c_master_stop(cmd);

    esp_err_t ret = lidar_cmd_begin_with_retry(cmd);

    i2c_cmd_link_delete(cmd);
    return ret;
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Public API                                                         */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * @brief Configure the LIDAR for the desired operating mode.
 *
 * Mirrors Garmin's configure() function.
 *
 * @param mode  0 = max range (default)
 *              1 = balanced
 *              2 = short range / high speed
 *              3 = mid range / higher speed
 *              4 = max range / higher speed on short targets
 *              5 = very short range / highest speed / high error
 */
esp_err_t lidar_configure(uint8_t mode)
{
    uint8_t sig_count_max;
    uint8_t acq_config;

    switch (mode) {
        case 1:  sig_count_max = 0x80; acq_config = 0x08; break;
        case 2:  sig_count_max = 0x18; acq_config = 0x00; break;
        case 3:  sig_count_max = 0x80; acq_config = 0x00; break;
        case 4:  sig_count_max = 0xFF; acq_config = 0x00; break;
        case 5:  sig_count_max = 0x04; acq_config = 0x00; break;
        default: sig_count_max = 0xFF; acq_config = 0x08; break; /* mode 0 */
    }

    esp_err_t ret;
    ret = lidar_write_reg(REG_SIG_COUNT_VAL, sig_count_max);
    if (ret != ESP_OK) return ret;
    ret = lidar_write_reg(REG_ACQ_CONFIG, acq_config);
    return ret;
}

/**
 * @brief Check whether the LIDAR is still busy with a measurement.
 *
 * @param busy_out  Set to 1 if busy, 0 if ready.
 * @return ESP_OK on success.
 */
esp_err_t lidar_get_busy_flag(uint8_t *busy_out)
{
    if (busy_out == NULL) {
        return ESP_ERR_INVALID_ARG;
    }

    uint8_t status = 0;
    esp_err_t ret = lidar_read_reg(REG_STATUS, &status, 1);
    if (ret == ESP_OK) {
        *busy_out = status & STATUS_BUSY_MASK;
    }
    return ret;
}

/**
 * @brief Block until the LIDAR finishes its current measurement.
 */
esp_err_t lidar_wait_for_ready(void)
{
    uint8_t busy = 1;
    esp_err_t ret;
    do {
        ret = lidar_get_busy_flag(&busy);
        if (ret != ESP_OK) return ret;
        if (busy) {
            vTaskDelay(pdMS_TO_TICKS(LIDAR_READY_POLL_DELAY_MS));
        }
    } while (busy);
    return ESP_OK;
}

/**
 * @brief Trigger a single range measurement.
 *
 * Non-blocking — call lidar_wait_for_ready() before reading distance.
 */
esp_err_t lidar_take_range(void)
{
    return lidar_write_reg(REG_ACQ_COMMAND, ACQ_CMD_TAKE_RANGE);
}

/**
 * @brief Read the distance result from the last completed measurement.
 *
 * Reads two bytes starting at 0x10 (low byte) and 0x11 (high byte)
 * in a single burst and assembles them into a 16-bit centimetre value.
 * This matches how Garmin's readDistance() works internally.
 *
 * @param distance_cm_out  Distance in centimetres.
 * @return ESP_OK on success.
 */
esp_err_t lidar_read_distance(uint16_t *distance_cm_out)
{
    if (distance_cm_out == NULL) {
        return ESP_ERR_INVALID_ARG;
    }

    uint8_t bytes[2] = {0, 0};
    esp_err_t ret = lidar_read_reg(REG_DISTANCE_LOW, bytes, 2);
    if (ret == ESP_OK) {
        /* bytes[0] = low byte (0x10), bytes[1] = high byte (0x11) */
        *distance_cm_out = (uint16_t)bytes[0] | ((uint16_t)bytes[1] << 8);
    }
    return ret;
}

