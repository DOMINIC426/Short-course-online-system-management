package com.scms.service;

import com.scms.dto.LoginRequest;
import com.scms.dto.RegisterResponse;
import com.scms.dto.RegisterUserRequest;
import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import com.scms.exception.UserAlreadyExistException;
import com.scms.jwt.JwtService;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ************************* REGISTER USER ******************
    public RegisterResponse register(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistException("This email is already registered, go to login page");
        }

        Users user = modelMapper.map(request, Users.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        Users savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        RegisterResponse response = modelMapper.map(savedUser, RegisterResponse.class);

        // response.setToken(token);

        return response;
    }

    // ************************* LOGIN USER ******************
    public String login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return jwtService.generateToken(userDetails);
    }
}