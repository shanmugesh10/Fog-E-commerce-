package com.fog.fog.service;

import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fog.fog.model.User;
import com.fog.fog.repository.Userrepository;

@Service
public class UserService {

    private final Userrepository userrepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            Userrepository userrepository,
            PasswordEncoder passwordEncoder) {

        this.userrepository = userrepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User saveUser(User user) {
        String username = user.getUsername();
        String email = user.getEmail();
        String password = user.getPassword();

        if (username == null || username.isBlank()
                || username.trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username must contain 1 to 100 characters"
            );
        }

        if (email == null || email.trim().length() > 254
                || !email.trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a valid email address"
            );
        }

        if (password == null || password.length() < 8
                || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must have at least 8 characters and at most 72 bytes"
            );
        }

        email = email.trim();

        if (userrepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered"
            );
        }

        User newUser = new User(
                username.trim(),
                email,
                passwordEncoder.encode(password)
        );

        return userrepository.save(newUser);
    }

    public User findByEmail(String email) {
        return userrepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Please sign in again"
                ));
    }
}