package com.fog.fog.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
@Service
public class Rawgservices {
    @Value("${rawg.api.key}")
    private String apiKey;
    @Value("${rawg.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getGames(){
            String url= apiUrl + "/games?key=" + apiKey;
            return  restTemplate.getForObject(url,String.class);
    }
}
