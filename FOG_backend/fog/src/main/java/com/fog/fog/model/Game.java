package com.fog.fog.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
@Entity
public class Game{
    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private Double  price;
    public Long getId(){
        return id;
    }
    public String getName(){
        return name;
    }
    public Double getprice(){
        return price;
    }
    public void setName(String name){
        this.name=name;
    }
    public void setprice(Double price){
        this.price=price;
    }
}