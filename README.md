# Ping-pong-club


# 🚀 Roadmap Integrazioni: OfficePong

Questo documento delinea le prossime funzionalità da implementare nella piattaforma **OfficePong** per migliorare l'esperienza utente, la navigazione dei dati e la personalizzazione dei profili.

## 1. Filtri Avanzati per la Classifica (Leaderboard)

Per evitare che la classifica diventi caotica o ingiusta (es. utenti con una sola partita vinta che restano primi per sempre), verranno introdotti dei filtri di ordinamento e di sbarramento direttamente nella Dashboard (`index.html`).

### 🛠️ Specifiche Funzionali

L'utente sopra la tabella della classifica troverà una barra di controllo con le seguenti opzioni:

* **Ordinamento Principale (Toggles/Dropdown):**
  * **Punti ELO (Default):** Ordina i giocatori dal punteggio ELO più alto al più basso.
  * **Win Rate (%):** Ordina in base alla percentuale di vittorie.
  * **Partite Giocate (PG):** Ordina in base all'attività (chi ha giocato più match).
* **Filtro di Sbarramento (Soglia Minima):**
  * Un input o checkbox del tipo *"Mostra solo giocatori con almeno X partite"* (es. minimo 3 o 5 match). Questo serve a pulire la classifica dagli utenti inattivi o "occasionali".

### 💻 Approccio Tecnico

I filtri verranno gestiti interamente **lato frontend** all'interno della funzione `updateUI()`.
Prima di renderizzare l'array `ranked` con il `.map()`, applicheremo un `.filter()` basato sulla soglia minima di partite e modificheremo i parametri del `.sort()` in base al bottone cliccato dall'utente.

## 2. Foto Profilo Utente (Opzionale)

Per rendere l'interfaccia visivamente più ricca e riconoscibile, ogni utente potrà associare un'immagine al proprio profilo. La funzionalità sarà completamente facoltativa.

### 🛠️ Specifiche Funzionali

* **Creazione Utente:** Nel box "Nuovo Giocatore" verrà aggiunto un campo di input opzionale.
* **Visualizzazione:** La foto comparirà:
  1. Accanto al nome nella classifica generale (in formato miniatura circolare).
  2. Nello storico delle partite (accanto al nome del vincitore/perdente).
  3. In grande nella pagina del profilo personale (`player.html`).
* **Fallback (Placeholder):** Se l'utente non carica una foto, il sistema mostrerà automaticamente un avatar generico o l'emoji standard 👤.

### 💻 Approccio Tecnico (Scelte di Implementazione)

Per mantenere l'architettura semplice e  *serverless* , ci sono due strade possibili:

> 🔹 **Opzione A (Ultra-Semplice - Consigliata per iniziare):** > Si aggiunge una colonna `avatar_url` (di tipo `text`) nella tabella `players` su Supabase. Nel form di registrazione, l'utente incolla semplicemente il link di un'immagine (es. da Slack, LinkedIn o un sito di avatar).
>
> 🔹 **Opzione B (Avanzata):** > Utilizzare il servizio **Supabase Storage** (Bucket gratuito) per permettere il caricamento di file reali `.jpg`/`.png` dal computer. Questa opzione richiede la configurazione dei permessi di upload lato Supabase.

## 3. Impatto sul Database (Schema Update)

Se si sceglie l'**Opzione A** per le foto profilo, l'unica modifica da fare sul database tramite l'SQL Editor di Supabase sarà l'aggiunta della colonna per l'URL dell'immagine:

**SQL**

```
-- Esegui questo comando nell'SQL Editor per aggiornare la tabella esistente
ALTER TABLE players 
ADD COLUMN avatar_url TEXT DEFAULT NULL;
```

## 📌 Prossimi Passi per lo Sviluppo

1. Modificare lo schema del DB su Supabase (aggiungendo la colonna per l'avatar).
2. Aggiornare l'interfaccia di `index.html` inserendo la barra dei filtri sopra la tabella e il campo input nel form del nuovo giocatore.
3. Aggiornare la logica di ordinamento in JavaScript per abilitare i filtri dinamici senza ricaricare la pagina.
4. Aggiornare `player.html` per mostrare l'immagine del profilo dinamica.
