alter table conversations add column if not exists mode text not null default 'menu';
alter table conversations add column if not exists ai_enabled boolean not null default true;
alter table conversations add column if not exists last_human_reply_at timestamptz;

alter table messages add column if not exists options jsonb;
alter table messages add column if not exists kind text;

-- allow 'ai' as a sender
alter table messages drop constraint if exists messages_sender_check;
alter table messages add constraint messages_sender_check
  check (sender in ('user', 'admin', 'ai'));

-- when a human admin replies, the chat switches to live-agent mode
create or replace function note_admin_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sender = 'admin' then
    update conversations
    set last_human_reply_at = now(), mode = 'human'
    where id = new.conversation_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_note_admin_reply on messages;
create trigger trg_note_admin_reply
after insert on messages
for each row execute function note_admin_reply();

-- admin can update conversations (AI on/off)
drop policy if exists "admin updates conversations" on conversations;
create policy "admin updates conversations"
on conversations for update to authenticated
using (auth.uid() = '935b6c78-7da2-4111-bdd5-f4d4a4826699')
with check (auth.uid() = '935b6c78-7da2-4111-bdd5-f4d4a4826699');

-- users can read all messages (user, ai, admin) in their own conversation
drop policy if exists "users read own conversation messages" on messages;
create policy "users read own conversation messages"
on messages for select to authenticated
using (
  exists (
    select 1 from conversations c
    where c.id = messages.conversation_id and c.user_id = auth.uid()
  )
);
