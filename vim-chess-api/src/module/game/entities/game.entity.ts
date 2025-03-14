export class Game {
    id: number;
    uid_white: string;
    uid_black: string;
    chess: any;
    uid_winner?: string;
    uid_loser?: string;
    max_time: number;
    is_finish: boolean;
    is_draw: boolean;
    createdAt: Date;
    updatedAt: Date;

}
