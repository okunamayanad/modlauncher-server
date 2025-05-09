export class Profile {
  uuid: String;
  username: String;
  password: String;

  constructor(username: string, password: string) {
    this.uuid = crypto.randomUUID();
    this.username = username;
    this.password = password;
  }
}
