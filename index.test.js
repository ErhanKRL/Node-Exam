import app from "./index";
import request from "supertest";


describe('POST /users', () => {
    it('should return HTTP success for valid request', async () => {
      const response = await request(app)
        .post('/users')
        .send({ "name": "exampleUser", "password": "password123" });
      expect(response.status).toBe(201);
      done();
    });
  
    it('should return HTTP error for invalid request', async () => {
      const response = await request(app)
        .post('/users')
        .send({}); 
      expect(response.status).toBe(400); 
    });
  });