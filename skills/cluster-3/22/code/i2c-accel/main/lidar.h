#ifndef LIDAR_H
#define LIDAR_H

#include <stdint.h>
#include "esp_err.h"

esp_err_t lidar_configure(uint8_t mode);
esp_err_t lidar_get_busy_flag(uint8_t *busy_out);
esp_err_t lidar_wait_for_ready(void);
esp_err_t lidar_take_range(void);
esp_err_t lidar_read_distance(uint16_t *distance_cm_out);

#endif /* LIDAR_H */
