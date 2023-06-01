use tauri::{AppHandle, ClipboardManager, Manager};
use tokio::time;

use crate::database::{Database, save_cur_clipboard};


pub async fn clipboard_task(app_handle: &AppHandle) {
    let mut interval = time::interval(time::Duration::from_secs(2));
    let mut prev: String = String::from("");
    loop {
        interval.tick().await;
        let content = app_handle.clipboard_manager().read_text().unwrap().unwrap();
        println!("read clipboard");
        println!("content: {}, {}", content.to_string(),prev);
        if !content.is_empty() && content != "" && content != prev {
            let database = app_handle.state::<Database>();
            prev = content.clone();
            let last_id = save_cur_clipboard(database, content).await.unwrap();
            app_handle.get_window("main").unwrap().emit_all("update_clipboard", last_id).unwrap();
        }
    }
}