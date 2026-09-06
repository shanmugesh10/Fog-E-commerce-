package com.fog.fog.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fog.fog.service.Rawgservices;

@RestController
@RequestMapping("/api/rawg")
public class RawgController {

    private final Rawgservices rawgservices;

    public RawgController(Rawgservices rawgservices) {
        this.rawgservices = rawgservices;
    }
    @CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"})
    @GetMapping("/games")
    public String getGames() {
        return rawgservices.getGames();
    }
    @CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"})
@GetMapping("/games/{id}")
public String getGameDetails(@PathVariable Long id) {
    return rawgservices.getGameDetails(id);
} 
}