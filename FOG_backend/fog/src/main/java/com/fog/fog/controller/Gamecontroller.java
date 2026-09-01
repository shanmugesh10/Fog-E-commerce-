package com.fog.fog.controller;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fog.fog.model.Game;
import com.fog.fog.repository.Gamerepository;

@RestController
@RequestMapping("/api/games")
public class Gamecontroller{

    private final Gamerepository gamerepository;

    public Gamecontroller(Gamerepository gamerepository){
        this.gamerepository= gamerepository;
    }
    @GetMapping
    public List<Game> games() {
        return gamerepository.findAll();
    }
    @PostMapping
    public String addGame(@RequestBody Game game){
        gamerepository.save(game);
        return "Game added";
    }
}
