package com.scms.config;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> allowedOrigins = corsProperties.allowedOrigins();
        String[] origins;
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            origins = allowedOrigins.stream()
                    .flatMap(origin -> java.util.Arrays.stream(origin.split(",")))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toArray(String[]::new);
        } else {
            origins = new String[]{"http://localhost:5173", "http://localhost:5174"};
        }

        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
