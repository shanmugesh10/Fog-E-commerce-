package com.fog.fog.controller;

import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping("/games")
    public String getGames() {
        return rawgservices.getGames();
    }
}