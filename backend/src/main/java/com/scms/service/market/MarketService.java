package com.scms.service.market;

import com.scms.dto.market.CourseResponse;
import com.scms.dto.market.CreateCourseDto;
import com.scms.entity.Course;
import com.scms.exception.CourseAlreadyExistException;
import com.scms.exception.UserNotFoundException;
import com.scms.repository.CourseRepository;
import lombok.*;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@RequiredArgsConstructor
@Service
public class MarketService {
    private final ModelMapper modelMapper;
    private final CourseRepository courseRepository;


//// ************************************************************* CREATE COURSE
    @PreAuthorize("hasRole(MARKET_OFFICER)")
    public CourseResponse registerCourse(CreateCourseDto request) {
        //find if course exist
        Course course = modelMapper.map(request, Course.class);

        if(courseRepository.existsByTitle(request.getTitle())){
            throw new CourseAlreadyExistException("Course with title " + request.getTitle() + " already exists");
        }
        course.setIsAvailable(true);
        course.setCreatedAt(LocalDate.now());
        Course savedCourse = courseRepository.save(course);
        return modelMapper.map(savedCourse, CourseResponse.class);
    }


    // **************************************** EDIT COURSE
    @PreAuthorize("hasRole(MARKET_OFFICER)")
    public CourseResponse editCourse(Long id, CreateCourseDto request) {
        // 1. find course if exist by Id
        Course course = courseRepository.findById(id).
                orElseThrow(()->new UserNotFoundException("course does not exist"));
        //2. edit course if exist but by patch mapping
        if(request.getTitle() != null) {
            course.setTitle(request.getTitle());
        }
        if(request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if(request.getCapacity() != null) {
            course.setCapacity(request.getCapacity());
        }
        if(request.getFee() != null) {
            course.setFee(request.getFee());
        }


        // save course
        Course savedCourse = courseRepository.save(course);
        return modelMapper.map(savedCourse, CourseResponse.class);

    }

    ///// ******************************************************** DELETE THE COURSE

    @PreAuthorize("hasRole(MARKET_OFFICER)")
    public String deleteCourse(Long id) {
        Course course =courseRepository.findById(id).orElseThrow(()->new UserNotFoundException("course does not exist"));
        courseRepository.delete(course);
        return "Courses "+course.getTitle() + " has been deleted";

    }

    @PreAuthorize("hasRole(MARKET_OFFICER)")
    public List<CourseResponse> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(c->modelMapper.map(c, CourseResponse.class))
                .toList();
    }

   // @PreAuthorize("hasRole(MARKET_OFFICER)")







}
