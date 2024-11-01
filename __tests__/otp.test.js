const { generateOTP, verifyOTP } = require('./otp'); 

test('should generate a valid OTP', async () => {
    const userId = 'test@example.com';
    const otp = await generateOTP(userId);
    expect(otp).toMatch(/^\d{6}$/); 
});

test('should verify correct OTP', async () => {
    const userId = 'test@example.com';
    const otp = await generateOTP(userId);
    const result = await verifyOTP(userId, otp);
    expect(result).toBe(true);
});

test('should reject expired OTP', async () => {
    const userId = 'test@example.com';
    const otp = await generateOTP(userId);
    await new Promise(resolve => setTimeout(resolve, 300000)); 
    const result = await verifyOTP(userId, otp);
    expect(result).toBe(false);
});
