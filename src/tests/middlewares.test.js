const jwt = require('jsonwebtoken');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

describe('Middlewares', () => {
    let mockReq;
    let mockRes;
    let nextFn;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFn = jest.fn();
    });

    describe('authenticateToken', () => {
        test('debe llamar next con token válido', () => {
            const token = jwt.sign(
                { id_usuario: 1, username: 'testuser' },
                process.env.JWT_SECRET
            );
            
            mockReq.headers['authorization'] = `Bearer ${token}`;
            
            authenticateToken(mockReq, mockRes, nextFn);
            
            expect(nextFn).toHaveBeenCalled();
            expect(mockReq.user).toBeDefined();
        });

        test('debe retornar 401 sin token', () => {
            authenticateToken(mockReq, mockRes, nextFn);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(nextFn).not.toHaveBeenCalled();
        });

        test('debe retornar 403 con token inválido', () => {
            mockReq.headers['authorization'] = 'Bearer invalid-token';
            
            authenticateToken(mockReq, mockRes, nextFn);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });

    describe('isAdmin', () => {
        test('debe permitir acceso a admin', () => {
            mockReq.user = { role: 'admin' };
            
            isAdmin(mockReq, mockRes, nextFn);
            
            expect(nextFn).toHaveBeenCalled();
        });

        test('debe denegar acceso a no admin', () => {
            mockReq.user = { role: 'user' };
            
            isAdmin(mockReq, mockRes, nextFn);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });
});