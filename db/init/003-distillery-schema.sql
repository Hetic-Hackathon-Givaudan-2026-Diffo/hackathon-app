-- Distillerie : tubes, signaux (les « gouttes ») et verdicts.
-- Noms de tables fixés avec l'équipe Data, qui écrit dans ces tables.
-- Les nombres de signaux durables et buzz ne sont jamais stockés : l'API les calcule.

CREATE TABLE tubes (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('catalogue', 'new')),
  simulated BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE signaux (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tube_id INTEGER NOT NULL REFERENCES tubes (id) ON DELETE CASCADE,
  observed_on DATE NOT NULL,
  place TEXT NOT NULL,
  source_type TEXT NOT NULL,
  text TEXT NOT NULL,
  simulated BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX signaux_tube_id_idx ON signaux (tube_id);

-- Un verdict porte soit sur un tube (signal_id vide), soit sur un signal.
-- Le verdict d'un tube porte aussi sa confiance et la lecture de l'IA.
CREATE TABLE verdicts (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tube_id INTEGER NOT NULL REFERENCES tubes (id) ON DELETE CASCADE,
  signal_id INTEGER UNIQUE REFERENCES signaux (id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('durable', 'buzz')),
  reasons TEXT[] NOT NULL DEFAULT '{}',
  confidence NUMERIC(3, 2) CHECK (confidence BETWEEN 0 AND 1),
  ai_summary TEXT,
  ai_what_would_change TEXT,
  simulated BOOLEAN NOT NULL DEFAULT true,
  CHECK (
    (
      signal_id IS NULL
      AND confidence IS NOT NULL
      AND ai_summary IS NOT NULL
      AND ai_what_would_change IS NOT NULL
    )
    OR (signal_id IS NOT NULL AND cardinality(reasons) >= 1)
  )
);

-- Un seul verdict de tube par tube
CREATE UNIQUE INDEX verdicts_one_per_tube_idx ON verdicts (tube_id)
  WHERE signal_id IS NULL;
