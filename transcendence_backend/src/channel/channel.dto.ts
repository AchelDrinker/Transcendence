import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, isNotEmpty, IsArray, IsInt, Min } from 'class-validator';
import { IsAlphanumeric } from 'class-validator';
export class CreateChannelDto {
	
	@IsNotEmpty()
	@IsString()
	name: string;
	

	@IsOptional()
	@IsString()
	password?: string;

	@IsNotEmpty()
	@IsNumber()
	userId: number;

  @IsOptional() // Assurez-vous que "owner" est marqué comme facultatif
	@IsBoolean()
	isprivate?: boolean;

	@IsOptional()
    admins?: number[]; // Array contenant les userID des admins

    @IsOptional()
    members?: number[]; // Array contenant les userID des membres

	@IsOptional()
    banned?: number[]; // Array contenant les userID des membres bannis

	@IsOptional()
	muted?: number[]; // Array contenant les userID des membres bannis

// ===== LA SALOPE =====

	//@IsNotEmpty()
	//@IsNumber()
    //idToKick?: number;

	@IsOptional()
    owner?: number[]; // Array contenant les userID des membres
}

export class AddMembersDto {
	@IsNotEmpty()
	@IsArray()
	members: number[]; // Array contenant les userID des membres à ajouter
  }

  export class AddAdminsDto {
	@IsNotEmpty()
	@IsArray()
	admins: number[]; // Array contenant les userID des membres à ajouter
  }

  export class AddOwnerDto {
	@IsNotEmpty()
	@IsArray()
	owner: number[]; // Array contenant les userID des membres à ajouter
}

export class AddBanUserDto {
	@IsNotEmpty()
	@IsNumber()
	banned: number;

	@IsNumber()
	@IsNotEmpty()
	banneur: number;
  }

  export class AddKickUsersDto {
	@IsNotEmpty()
	@IsNumber()
	idToKick: number;

	@IsNotEmpty()
	@IsNumber()
	kickerId:number;

}

export class AddMuteUsersDto {
	@IsNotEmpty()
	@IsNumber()
	muted: number;

	@IsNotEmpty()
	@IsNumber()
	muteur: number;

	@IsInt()
	@Min(1)
	readonly mutedDuration: number; // Durée du mute en minutes
  }

export class UpdateChannelDto {
	
	@IsOptional()
	@IsString()
	password?: string;

	@IsOptional()
	@IsBoolean()
	isprivate?: boolean;
  }
