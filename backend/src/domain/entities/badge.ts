import { randomUUID } from "node:crypto";

export interface BadgeProps {
  id?: string;
  name: string;
  description: string;
  iconUrl: string;
}

export class Badge {
  private props: Required<BadgeProps>;

  constructor(props: BadgeProps) {
    this.props = {
      id: props.id ?? randomUUID(),
      name: props.name,
      description: props.description,
      iconUrl: props.iconUrl,
    };
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get iconUrl() {
    return this.props.iconUrl;
  }
}
