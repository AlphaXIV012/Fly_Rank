
const supabase = require("../config/supabase");

const authenticateUser = async (req, res, next) => {
    try {
        // 1. Get the Authorization header
        const authHeader = req.headers.authorization;

        // 2. Check that a Bearer token was provided
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Access token required"
            });
        }

        // 3. Extract the token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Access token required"
            });
        }

        // 4. Verify the token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                error: "Invalid or expired token"
            });
        }

        // 5. Attach the verified user to the request
        req.user = data.user;

        // 6. Allow the request to continue
        next();

    } catch (error) {
        console.error("Authentication middleware error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

module.exports = authenticateUser;
