-- Ids are text because they come from the export file (rest-1, loc-1, rv-101)
-- and the import upserts by them.

create table if not exists restaurants (
  id   text primary key,
  name text not null
);

create table if not exists locations (
  id            text primary key,
  restaurant_id text not null references restaurants (id),
  name          text not null
);

create table if not exists reviews (
  id           text primary key,
  location_id  text not null references locations (id),
  author       text not null,
  rating       smallint check (rating between 1 and 5),
  text         text not null default '',
  -- Google's timestamps, not ours: saving a reply does not touch updated_at,
  -- so the import can compare it against the file to keep the newest edit.
  published_at timestamptz not null,
  updated_at   timestamptz not null,
  reply_text   text check (reply_text is null or length(trim(reply_text)) > 0),
  replied_at   timestamptz,
  constraint reply_is_complete check ((reply_text is null) = (replied_at is null))
);

create index if not exists reviews_location_id_idx on reviews (location_id);
create index if not exists reviews_published_at_idx on reviews (published_at desc);

-- All reads and writes go through the server with the service_role key.
-- RLS on with no policies means the anon key cannot read or write anything.
alter table restaurants enable row level security;
alter table locations   enable row level security;
alter table reviews     enable row level security;
