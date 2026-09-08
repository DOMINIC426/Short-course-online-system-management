package com.scms.dto;
import com.scms.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponse{
   private Long id;
   private String firstName;
   private String lastName;
   private String email;
   private Role role;
   private String phone;
   private String token;

}