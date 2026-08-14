// package com.scms.service;

// import com.scms.dto.RegisterUserRequest;
// import com.scms.dto.RegisterResponse;
// import com.scms.entity.Users;
// import com.scms.entity.enums.Role;
// import com.scms.exception.UserAlreadyExistException;
// import com.scms.repository.UserRepository;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// @Service
// @RequiredArgsConstructor
// @Slf4j
// @Transactional(readOnly = true)  // Default: read-only for queries
// public class UserService {

//     private final UserRepository userRepository;

//     @Transactional
//     public RegisterResponse registerUser(RegisterUserRequest request) {

//         if (userRepository.existsByEmail(request.email())) {
//             throw new UserAlreadyExistException("User with email " + request.email() + " already exists");
//         }

//         // 2. Create entity using Builder
//         Users user = Users.builder()
//                 .firstName(request.firstName())
//                 .lastName(request.lastName())
//                 .email(request.email().toLowerCase().trim())
//                 .password(request.password())
//                 .role(request.role())
//                 .build();


//         Users savedUser = userRepository.save(user);

//         return RegisterResponse.fromUser(savedUser);
//     }


// }