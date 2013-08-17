/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/4/13
 * Time: 6:15 PM
 */
var passport = require('passport'),
	cfg = require('../../config'),
	GitHubStrategy = require('passport-github').Strategy,
	mongoose = require('mongoose'),
	User = mongoose.model('User')

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

var callbackUrl = 'http://' + cfg.hostname
if (cfg.github.usePort) {
	callbackUrl += ':' + cfg.port
}
callbackUrl += '/auth/github/callback'
console.log(callbackUrl)

passport.use(new GitHubStrategy({
		clientID: cfg.github.clientId,
		clientSecret: cfg.github.clientSecret,
		callbackURL: callbackUrl
	},
	function (accessToken, refreshToken, profile, done) {
		User.findOne({ 'github.id': profile.id }, function (err, user) {
			if (user) return done(err, user)

			user = new User({
				name: profile.displayName,
				email: profile.emails[0].value,
				username: profile.username,
				displayName: profile.username,
				provider: 'github',
				github: profile._json,
				type: profile._json.type,
				authToken: accessToken
			})
//			req.session.firstTime = true
			console.log(user)
			user.save(function (err) {
				if (err) console.log(err)
				return done(err, user)
			})
		})
	}
));

module.exports = passport