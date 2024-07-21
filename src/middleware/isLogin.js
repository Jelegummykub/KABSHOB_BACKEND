const jwt = require('jsonwebtoken');

const isLogin = () => async(req,res,next) => {
    const autheader = req.headers.authorization;
    if(!autheader){
        return res.status(400).json({
            result : false,
            status : "error",
            msg : `เกิดข้อผิดพลาด`,
        })
    }
    const authbearer = autheader.split(" ");
    const authtoken = authbearer[1];
    if(authbearer[0] !== "Bearer" && authtoken == null)
        return res.status(400).json({
        result : false,
        status : "error",
        msg : `เกิดข้อผิดพลาด`,
    })
    jwt.verify(authtoken,process.env.JWT_SECERT , async function(err , decode){
        if(err != null || decode.exp > new Date().getTime()){
            return res.status(400).json({
                result : false,
                status : "warning",
                msg : `กรุณาทำการเข้าสู่ระบบใหม่`,
            })
        }
        req.users = decode
    })
        return next();
}

module.exports = isLogin;