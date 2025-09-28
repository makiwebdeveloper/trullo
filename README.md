# Trullo

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

## Teoretiska resonemang

Jag valde PostgreSQL och Prisma ORM för databasen eftersom Trullo-projektet består av sammankopplade modeller, och jag tyckte det var mer praktiskt att använda en relationsdatabas.

Jag bestämde mig för att experimentera med att använda bun js som pakethanterare; det installerar beroenden och startar applikationen väldigt snabbt.

Jag skapade /docs-slutpunkten med Swagger för att göra det enklare för dig att testa applikationen.

## Testa

För att rensa och generera data i databasen, använd:

```bash
bun run seed
```

Logga in som
e-post: "admin@example.com",
lösenord: "12345678",

eller

e-post: "user@example.com"
lösenord: "12345678",

Spara token i Swagger och testa!
