/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("users", function (table) {
        table.uuid("id").primary();
        table.string("email", 255).notNullable().unique();
        table.string("password_hash", 255).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("users");
};
