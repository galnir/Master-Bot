// based on remix-auth-socials by @TheRealFlyingCoder
import type { StrategyVerifyCallback } from "remix-auth";
import {
  type OAuth2Profile,
  OAuth2Strategy,
  type OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";
import type { APIGuild } from "discord-api-types/v10";

export type DiscordScope =
  | "activities.read"
  | "activities.write"
  | "applications.builds.read"
  | "applications.builds.upload"
  | "applications.commands"
  | "applications.commands.update"
  | "applications.entitlements"
  | "applications.store.update"
  | "bot"
  | "connections"
  | "email"
  | "gdm.join"
  | "guilds"
  | "guilds.join"
  | "guilds.members.read"
  | "identify"
  | "messages.read"
  | "relationships.read"
  | "rpc"
  | "rpc.activities.write"
  | "rpc.notifications.read"
  | "rpc.voice.read"
  | "rpc.voice.write"
  | "webhook.incoming";

export interface DiscordStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: DiscordScope[];
  prompt?: "none" | "consent";
}

/**
 * @
 */
export interface DiscordProfile extends OAuth2Profile {
  id: string;
  displayName: string;
  emails?: [{ value: string }];
  photos?: [{ value: string }];
  guilds?: APIGuild[];
  __json: {
    /**
     * the user's id
     */
    id: string;
    /**
     * the user's username, not unique across the platform
     */
    username: string;
    /**
     * the user's 4-digit discord-tag
     */
    discriminator: string;
    /**
     * the user's avatar hash
     * @see https://discord.com/developers/docs/reference#image-formatting
     */
    avatar: string | null;
    /**
     * whether the user belongs to an OAuth2 application
     */
    bot?: boolean;
    /**
     * whether the user is an Official Discord System user (part of the urgent message system)
     */
    system?: boolean;
    /**
     * whether the user has two factor enabled on their account
     */
    mfa_enabled?: boolean;
    /**
     * the user's banner hash
     * @see https://discord.com/developers/docs/reference#image-formatting
     */
    banner?: string | null;
    /**
     * the user's banner color encoded as an integer representation of hexadecimal color code
     */
    accent_color?: string | null;
    /**
     * the user's chosen language option
     */
    locale?: string;
    /**
     * 	whether the email on this account has been verified
     */
    verified?: boolean;
    /**
     * the user's email
     */
    email?: string | null;
    /**
     * the flags on a user's account
     * @see https://discord.com/developers/docs/resources/user#user-object-user-flags
     */
    flags?: number;
    /**
     * the type of Nitro subscription on a user's account
     * @see https://discord.com/developers/docs/resources/user#user-object-premium-types
     */
    premium_type?: number;
    /**
     * the public flags on a user's account
     * @see https://discord.com/developers/docs/resources/user#user-object-user-flags
     */
    public_flags?: number;
  };
}

export interface DiscordExtraParams
  extends Record<string, Array<DiscordScope> | string | number> {
  expires_in: 604_800;
  token_type: "Bearer";
  scope: string;
}

const DiscordScopeSeperator = " ";

export class DiscordStrategy<User> extends OAuth2Strategy<
  User,
  DiscordProfile,
  DiscordExtraParams
> {
  name = "discord";

  private scope: DiscordScope[];
  private prompt?: "none" | "consent";
  private userInfoURL = "https://discord.com/api/users/@me";

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      prompt,
      scope,
    }: DiscordStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<DiscordProfile, DiscordExtraParams>
    >
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        // @ts-ignore
        scope,
        prompt,
        authorizationURL: "https://discord.com/api/oauth2/authorize",
        tokenURL: "https://discord.com/api/oauth2/token",
      },
      verify
    );

    this.scope = ["identify", "guilds", "guilds.members.read"];
    this.prompt = prompt;
  }

  protected authorizationParams() {
    const params = new URLSearchParams({
      scope: this.scope.join(DiscordScopeSeperator),
    });
    if (this.prompt) params.set("prompt", this.prompt);
    return params;
  }

  protected async userProfile(accessToken: string): Promise<DiscordProfile> {
    const userResponse = await fetch(this.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const user: DiscordProfile["__json"] = await userResponse.json();

    const guildsResponse = await fetch(
      `https://discord.com/api/users/@me/guilds`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const guilds = await guildsResponse.json();

    const profile: DiscordProfile = {
      provider: "discord",
      id: user.id,
      displayName: user.username,
      emails: user.email ? [{ value: user.email }] : undefined,
      photos: user.avatar ? [{ value: user.avatar }] : undefined,
      guilds: guilds.filter((guild: APIGuild) => guild.owner),
      __json: user,
    };

    return profile;
  }

  protected async getAccessToken(response: Response): Promise<{
    accessToken: string;
    refreshToken: string;
    extraParams: DiscordExtraParams;
  }> {
    const { access_token, refresh_token, scope, ...extraParams } =
      await response.json();
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      extraParams: { ...extraParams, scope: scope.split(" ") },
    };
  }
}
