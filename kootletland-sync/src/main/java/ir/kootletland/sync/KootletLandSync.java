package ir.kootletland.sync;

import net.luckperms.api.LuckPerms;
import net.luckperms.api.LuckPermsProvider;
import net.luckperms.api.event.node.NodeMutateEvent;
import net.luckperms.api.model.user.User;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public final class KootletLandSync extends JavaPlugin implements Listener {
    private LuckPerms luckPerms;
    private Database database;

    @Override
    public void onEnable() {
        saveDefaultConfig();

        try {
            luckPerms = LuckPermsProvider.get();
        } catch (IllegalStateException e) {
            getLogger().severe("LuckPerms API is not available.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        database = new Database(this);
        database.initialize();

        Bukkit.getPluginManager().registerEvents(this, this);
        luckPerms.getEventBus().subscribe(NodeMutateEvent.class, event -> {
            if (!(event.getTarget() instanceof User user)) return;
            Player player = Bukkit.getPlayer(user.getUniqueId());
            if (player != null) syncPlayer(player, true);
        });

        long interval = Math.max(10, getConfig().getLong("sync.interval-seconds", 60));
        Bukkit.getScheduler().runTaskTimerAsynchronously(this, this::syncOnlinePlayers, 20L, interval * 20L);

        getLogger().info("KootletLandSync enabled.");
    }

    @Override
    public void onDisable() {
        if (database != null) {
            database.close();
        }
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        if (!getConfig().getBoolean("sync.sync-on-join", true)) return;
        syncPlayer(event.getPlayer(), true);
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        if (!getConfig().getBoolean("sync.sync-on-quit", true)) return;
        syncPlayer(event.getPlayer(), false);
    }

    private void syncOnlinePlayers() {
        for (Player player : Bukkit.getOnlinePlayers()) {
            syncPlayer(player, true);
        }
    }

    private void syncPlayer(Player player, boolean online) {
        UUID uuid = player.getUniqueId();

        CompletableFuture<User> future = luckPerms.getUserManager().loadUser(uuid);
        future.thenAcceptAsync(user -> {
            try {
                database.upsertPlayer(player, user, online);
            } catch (Exception e) {
                getLogger().warning("Failed to sync " + player.getName() + ": " + e.getMessage());
            }
        });
    }

    static String clean(String value) {
        if (value == null || value.isBlank()) return null;
        return value.replace("§", "&");
    }

    static String skinUrl(String username) {
        return "https://mc-heads.net/avatar/" + username + "/128";
    }

    static final class Database {
        private final KootletLandSync plugin;
        private Connection connection;

        Database(KootletLandSync plugin) {
            this.plugin = plugin;
        }

        synchronized void initialize() {
            try {
                connection = DriverManager.getConnection(
                    plugin.getConfig().getString("database.url"),
                    plugin.getConfig().getString("database.username"),
                    plugin.getConfig().getString("database.password")
                );

                try (Statement statement = connection.createStatement()) {
                    statement.executeUpdate("""
                        CREATE TABLE IF NOT EXISTS players (
                            uuid VARCHAR(36) PRIMARY KEY,
                            username VARCHAR(32) NOT NULL UNIQUE,
                            skin_url TEXT,
                            rank_name VARCHAR(64),
                            rank_prefix TEXT,
                            rank_suffix TEXT,
                            rank_weight INT NOT NULL DEFAULT 0,
                            online BOOLEAN NOT NULL DEFAULT FALSE,
                            playtime_minutes INT NOT NULL DEFAULT 0,
                            coins BIGINT NOT NULL DEFAULT 0,
                            kills BIGINT NOT NULL DEFAULT 0,
                            deaths BIGINT NOT NULL DEFAULT 0,
                            first_joined_at TIMESTAMP NULL,
                            last_seen_at TIMESTAMP NULL
                        )
                    """);

                    addColumnIfMissing(statement, "rank_prefix", "TEXT");
                    addColumnIfMissing(statement, "rank_suffix", "TEXT");
                    addColumnIfMissing(statement, "rank_weight", "INT NOT NULL DEFAULT 0");
                }
            } catch (SQLException e) {
                plugin.getLogger().severe("Database initialization failed: " + e.getMessage());
            }
        }

        private void addColumnIfMissing(Statement statement, String name, String definition) throws SQLException {
            try {
                statement.executeUpdate("ALTER TABLE players ADD COLUMN " + name + " " + definition);
            } catch (SQLException ignored) {
            }
        }

        synchronized void upsertPlayer(Player player, User user, boolean online) throws SQLException {
            if (connection == null || connection.isClosed()) initialize();
            if (connection == null || connection.isClosed()) throw new SQLException("Database connection unavailable");

            var queryOptions = user.getQueryOptions();
            var meta = user.getCachedData().getMetaData();
            String rank = clean(user.getPrimaryGroup());
            String prefix = clean(meta.getPrefix());
            String suffix = clean(meta.getSuffix());

            int weight = user.getInheritedGroups(queryOptions).stream()
                .map(group -> group.getWeight().orElse(0))
                .max(Integer::compareTo)
                .orElse(0);

            String username = player.getName();
            String skin = skinUrl(username);
            try (PreparedStatement statement = connection.prepareStatement("""
                INSERT INTO players (
                    uuid, username, skin_url, rank_name, rank_prefix, rank_suffix,
                    rank_weight, online, first_joined_at, last_seen_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    skin_url = VALUES(skin_url),
                    rank_name = VALUES(rank_name),
                    rank_prefix = VALUES(rank_prefix),
                    rank_suffix = VALUES(rank_suffix),
                    rank_weight = VALUES(rank_weight),
                    online = VALUES(online),
                    last_seen_at = VALUES(last_seen_at)
            """)) {
                statement.setString(1, player.getUniqueId().toString());
                statement.setString(2, username);
                statement.setString(3, skin);
                statement.setString(4, rank);
                statement.setString(5, prefix);
                statement.setString(6, suffix);
                statement.setInt(7, weight);
                statement.setBoolean(8, online);
                statement.executeUpdate();
            }
        }

        synchronized void close() {
            if (connection == null) return;
            try {
                connection.close();
            } catch (SQLException ignored) {
            }
        }
    }
}