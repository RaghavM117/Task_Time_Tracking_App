import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import prisma from "./connection.js";

passport.use(
    new GithubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            callbackURL: process.env.GITHUB_CALLBACK_URL!,
            passReqToCallback: true,
        },
        async (
            req: any,
            accessToken: string,
            refreshToken: string,
            profile: any,
            done: any,
        ) => {
            try {
                let user = await prisma.user.findFirst({
                    where: { providerId: profile.id },
                });
                let isNewUser = false;

                if (!user) {
                    const email = profile.emails?.[0]?.value;
                    if (!email) {
                        return done(
                            new Error("Email was not found in Github Profile!"),
                            null,
                        );
                    }

                    // check if email already exists to link accounts
                    user = await prisma.user.findUnique({ where: { email } });

                    if (user) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                providerId: profile.id,
                                provider: "github",
                            },
                        });
                    } else {
                        user = await prisma.user.create({
                            data: {
                                name:
                                    profile.displayName ||
                                    profile.username ||
                                    email.split("@")[0],
                                email,
                                provider: "github",
                                providerId: profile.id,
                            },
                        });
                        isNewUser = true;
                    }
                }

                req.authAction = isNewUser ? "register" : "login";
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        },
    ),
);

export default passport;
