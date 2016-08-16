DROP TABLE IF EXISTS "events_test";
CREATE TABLE "events_test" (
	"id"		serial			PRIMARY KEY NOT NULL,
	"name"		varchar(50)		NOT NULL,
	"user_id"	varchar(25)		NOT NULL,
	"dt"		timestamp		NOT NULL
);