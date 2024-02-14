import app from "./index";
import request from "supertest";

describe('Users API', () => {
    it('should return all users', async () => {
        const response = await request(app).get('/users');
        expect(response.statusCode).toBe(200);
    });
});


describe('POST /users', () => {
    it('should return HTTP success for valid request', async () => {
      const response = await request(app)
        .post('/users')
        .send({ username: 'exampleUser', password: 'password123' });
      expect(response.status).toBe(201);
    });
  
    it('should return HTTP error for invalid request', async () => {
      const response = await request(app)
        .post('/users')
        .send({}); 
      expect(response.status).toBe(400); 
    });
  });