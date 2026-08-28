package com.scms.dto.market;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseStatsResponse {
    private Long courseId;
    private String courseTitle;
    private Long totalRegisteredStudents;
    private Integer maxStudents;
}