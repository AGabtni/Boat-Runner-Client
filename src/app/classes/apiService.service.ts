import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';

 


const apiUrl = 'https://boat-runner-api-273004.appspot.com/'
 
@Injectable()
export class APIService {
 
    constructor(private http:HttpClient) {}
 
    // Uses http.get() to load data from a single API endpoint
    getScores() {
        return this.http.get(apiUrl);
    }


    saveScore(name, score){
        var body = {

            "Name" : name,
            "Score": score,
        }
        return this.http.put(apiUrl,body);

    }




}