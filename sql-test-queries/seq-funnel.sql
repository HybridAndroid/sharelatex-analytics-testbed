WITH 
	"step1" AS (
		SELECT "e1"."user_id", "e1"."name", "e1"."dt" FROM "events_test" AS "e1"
		WHERE "e1"."name" = 'event-a'
	),
	"step2" AS (
		SELECT "e2"."user_id", "e2"."name", "e2"."dt" FROM "events_test" AS "e2"
		WHERE "e2"."name" = 'event-b'
	),
	"step3" AS (
		SELECT "e3"."user_id", "e3"."name", "e3"."dt" FROM "events_test" AS "e3"
		WHERE "e3"."name" = 'event-c'
	),
	"funnels" AS (
		SELECT "step1"."user_id" as "user_id", "step1"."name" AS "e1", "step2"."name" AS "e2", "step3"."name" AS "e3"
		FROM "step1" 
			LEFT JOIN "step2" ON ("step1"."user_id" = "step2"."user_id" AND "step2"."dt" > "step1"."dt")
			LEFT JOIN "step3" ON ("step2"."user_id" = "step3"."user_id" AND "step3"."dt" > "step2"."dt")
		GROUP BY "step1"."user_id", "step1"."name", "step2"."name", "step3"."name"
	)

SELECT COUNT("e1") AS "e1", COUNT("e2") AS "e2", COUNT("e3") AS "e3" FROM "funnels"