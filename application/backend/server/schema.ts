import { pgTable, serial, text, varchar} from "drizzle-orm/pg-core";

export const gamesTable = pgTable('games', {
  id: serial('id').primaryKey(),
  cells: text("cells").array(),
  nextTurn: varchar({ length: 255 }).notNull(),
  winner: varchar({ length: 255 }),
});