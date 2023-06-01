
use std::collections::HashMap;
use std::{str::FromStr};

use convert_case::{Casing, Case};
use serde::{Serializer, Serialize};
use sqlx::{ConnectOptions, SqliteConnection, Executor, Any, SqlitePool, Row, Column, Value, Arguments, Sqlite};
use sqlx::sqlite::{SqliteConnectOptions, SqliteArguments};
use sqlx::migrate::MigrateDatabase;
use tauri::State;
use sqlx::{ValueRef};
use tokio::sync::Mutex;


#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Sql(#[from] sqlx::Error),
    #[error(transparent)]
    Migration(#[from] sqlx::migrate::MigrateError),
    #[error("database {0} not loaded")]
    DatabaseNotLoaded(String),
    #[error("unsupported datatype: {0}")]
    UnsupportedDatatype(String),
}

static DB_PATH: &'static str = "sqlite:clipboard.db";
static CREATE_CLIPBOARD: &'static str = "CREATE TABLE IF NOT EXISTS clipboard
(
    ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    CONTENT     TEXT NOT NULL,
    CREATED_AT TIMESTAMP NOT NULL DEFAULT (DATETIME('now','localtime')),
    UPDATED_AT TIMESTAMP NOT NULL DEFAULT (DATETIME('now','localtime'))
);";

pub async fn init(url: &str) -> Result<SqliteConnection, Error> {
    let connect_result = SqliteConnectOptions::from_str(url)?.connect().await;
    let mut exist = true;
    let mut connection_opt: Option<SqliteConnection> = None;
    match connect_result {
        Ok(connection) => {
            connection_opt = Some(connection);
        },
        Err(_) => {
            exist = false;
        }
    };
    if !exist {
        Any::create_database(DB_PATH).await?;
        connection_opt = Some(SqliteConnectOptions::from_str(DB_PATH)?.connect().await?);
    }
    match connection_opt {
        Some(mut connection) => {
            connection.execute(CREATE_CLIPBOARD).await?;
            Ok(connection)
        },
        None => {
            Err(Error::DatabaseNotLoaded("()".to_string()))
        }
    }
}

#[derive(Default)]
pub struct Database {
    pool: Mutex<HashMap<String,Option<SqlitePool>>>
}


pub async fn connect(db: State<'_, Database>, url: &str) {
    let mut pool = db.pool.lock().await;
    pool.insert("sqlite".to_string(), Some(SqlitePool::connect(url).await.unwrap()));
}



impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub async fn query_all_clipboard(pool: &sqlx::Pool<Sqlite>) -> Result<Vec<HashMap<String, String>>, Error> {
    let result = sqlx::query("SELECT * FROM clipboard").fetch_all(pool).await.unwrap();
    let mut list = Vec::new();
    for rec in result {
        let mut record = HashMap::new();
        for (i, column) in rec.columns().into_iter().enumerate(){
            let name = column.name().to_case(Case::Camel);
            let raw = rec.try_get_raw(i).unwrap();
            // let type_info = raw.type_info().to_string();
            let value: String = raw.to_owned().try_decode_unchecked().unwrap();
            record.insert(name.to_string(), value);
        }
        list.push(record);
    }
    Ok(list)
}

#[tauri::command]
pub async fn get_clipboard_contents(state: tauri::State<'_, Database>) -> Result<Vec<HashMap<String, String>>, Error> {
    let db_lock = state.pool.lock().await;
    let pool = db_lock.get("sqlite").unwrap().as_ref().unwrap();
    query_all_clipboard(pool).await
}

pub async fn save_cur_clipboard(state: tauri::State<'_, Database>, content: String) -> Result<Vec<HashMap<String, String>>, Error> {
    let db_lock = state.pool.lock().await;
    let pool = db_lock.get("sqlite").unwrap().as_ref().unwrap();
    let mut args = SqliteArguments::default();
    args.add(content);
    sqlx::query_with(r#"INSERT INTO clipboard(content) VALUES(?1)"#, args)
        .execute(pool)
        .await.unwrap()
        .last_insert_rowid();
    query_all_clipboard(pool).await
}
