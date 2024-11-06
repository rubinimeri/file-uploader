const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findFirst({ where: { id } });
        return done(null, user);
    } catch (err) {
        return done(err);
    }
})

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await prisma.user.findFirst({ where: { username } });

            if (!user) {
                return done(null, false, {message: "Incorrect username"});
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, {message: "Incorrect password"});
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

module.exports = passport;