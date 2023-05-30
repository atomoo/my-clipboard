// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, time::Duration};

use sqlx::Connection;
use tauri::{
    async_runtime::{block_on, spawn},
    Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, CustomMenuItem,
};
use tauri_plugin_positioner::{self, Position, WindowExt};
use tokio::time::sleep;
mod database;
mod clipboard;

fn main() {
    dotenv::dotenv().ok();
    let db_url = env::var("DATABASE_URL").unwrap();
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let system_tray_menu = SystemTrayMenu::new().add_item(quit);
    let mut application = tauri::Builder::default()
        .manage(database::Database::default())
        .setup(move |app| {
            let handle = app.app_handle();
            block_on(async {
                println!("spawn:>>>");
                let result = database::init(&db_url).await;
                match result {
                    Ok(connection) => {
                        connection.close();
                        let database = app.state::<database::Database>();
                        database::connect(database, &db_url).await;
                    }
                    Err(e) => println!("error: {}", e),
                }
            });
            spawn(async move {
                println!("sleep start");
                clipboard::clipboard_task(&handle).await;
                sleep(Duration::from_secs(10)).await;
                let database = handle.state::<database::Database>();
                println!("sleep end");
            });
            Ok(())
        })
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    let window = app.get_window("main").unwrap();
                    // toggle application window
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.move_window(Position::TrayCenter).unwrap();
                        window.set_focus().unwrap();
                    }
                },
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                },
                _ => {}
            }
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Focused(is_focused) => {
                // detect click outside of the focused window and hide the app
                if !is_focused {
                    event.window().hide().unwrap();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![database::get_clipboard_contents])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");
    #[cfg(target_os = "macos")]
    application.set_activation_policy(tauri::ActivationPolicy::Accessory);
    application.run(|_app_handle, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
    });
}
