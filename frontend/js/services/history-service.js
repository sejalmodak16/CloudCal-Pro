
/* =========================================================
   CLOUDCALC PRO
   HISTORY SERVICE
========================================================= */

(function () {

    "use strict";

    const TABLE = "calculations";

    window.CloudCalcHistory = {

        async getAll(options = {}) {

            const user =
                await this.getCurrentUser();

            if (!user) {
                return [];

            }

            const limit =
                Number(options.limit) || 100;

            let query =
                window.supabaseClient
                    .from(TABLE)
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", {
                        ascending: false
                    })
                    .limit(limit);

            if (options.from) {

                query =
                    query.gte(
                        "created_at",
                        options.from
                    );

            }

            if (options.to) {

                query =
                    query.lte(
                        "created_at",
                        options.to
                    );

            }

            const {
                data,
                error
            } = await query;

            if (error) {
                throw error;
            }

            return data || [];

        },


        async getRecent(limit = 10) {

            return this.getAll({
                limit
            });

        },


        async find(searchTerm) {

            const records =
                await this.getAll({
                    limit: 500
                });

            if (!searchTerm) {
                return records;
            }

            const search =
                String(searchTerm)
                    .toLowerCase()
                    .trim();

            return records.filter(item => {

                const expression =
                    String(
                        item.expression || ""
                    ).toLowerCase();

                const result =
                    String(
                        item.result ?? ""
                    ).toLowerCase();

                return (
                    expression.includes(search) ||
                    result.includes(search)
                );

            });

        },


        async delete(id) {

            const user =
                await this.getCurrentUser();

            if (!user) {
                throw new Error(
                    "User is not authenticated."
                );
            }

            const {
                error
            } = await window.supabaseClient
                .from(TABLE)
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) {
                throw error;
            }

            return true;

        },


        async clearAll() {

            const user =
                await this.getCurrentUser();

            if (!user) {
                throw new Error(
                    "User is not authenticated."
                );
            }

            const {
                error
            } = await window.supabaseClient
                .from(TABLE)
                .delete()
                .eq("user_id", user.id);

            if (error) {
                throw error;
            }

            return true;

        },


        async getCurrentUser() {

            if (!window.supabaseClient) {
                return null;
            }

            const {
                data,
                error
            } = await window.supabaseClient.auth
                .getUser();

            if (error) {
                return null;
            }

            return data?.user || null;

        }

    };

})();

