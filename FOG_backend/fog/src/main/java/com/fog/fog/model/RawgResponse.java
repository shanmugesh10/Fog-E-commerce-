package com.fog.fog.model;
import java.util.List;
public class RawgResponse {
    private int count;
    private List<RawgGame> results;

    public int getCount(){
        return count;
    }
    public void setCount(int count){
        this.count=count;
    }
    public List<RawgGame> getResults(){
        return results;
    }
    public void setResults(List<RawgGame> results){
        this.results=results;
    }
}
