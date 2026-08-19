export interface UserProps {
  id?: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  createdAt?: Date;
}

import { randomUUID } from "node:crypto";

export class User {
  private props: Required<UserProps>;

  constructor(props: UserProps) {
    this.props = {
      id: props.id ?? randomUUID(),
      username: props.username,
      email: props.email,
      passwordHash: props.passwordHash,
      avatarUrl: props.avatarUrl ?? null,
      createdAt: props.createdAt ?? new Date(),
    };
  }

  get id() {
    return this.props.id;
  }

  get username() {
    return this.props.username;
  }

  get email() {
    return this.props.email;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
