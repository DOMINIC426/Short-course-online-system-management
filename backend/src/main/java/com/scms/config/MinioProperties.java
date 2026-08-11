package com.scms.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "scms.minio")
public record MinioProperties(String endpoint, String accessKey, String secretKey) {
}
