import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';

@Injectable()

export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
	super({
	  clientID: process.env.API_U_ID,
	  clientSecret: process.env.API_S_SECRET,
	  callbackURL: process.env.NEXT_PUBLIC_API_URL_CALLBACK,
	  scope: 'public',
	});
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
	const { id, username, emails } = profile;

	// Récupération de la réponse brute
	const rawResponse = JSON.parse(profile._raw);

	// Extraction de l'URL de l'image de profil
	const imageUrl = rawResponse.image?.link || null;

	const user = {
	  imageUrl,
	  accessToken,
	  refreshToken,
	  id,
	  username,
	  emails,
	};

	console.log('user =', user);

	done(null, user);
  }
}