
/* =========================================================
   CLOUDCALC PRO
   DASHBOARD SERVICE
========================================================= */

(function () {

    "use strict";

    const TABLE = "calculations";

    window.CloudCalcDashboard = {

        async getSummary() {

            const user =
                await this.getCurrentUser();

            if (!user) {
                return {
                    total: 0,
                    today: 0,
                    recent: 0
                };
            }

            const {
                data,
                error
            } = await window.supabaseClient
                .from(TABLE)
                .select("id, created_at, expression, result")
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                throw error;
            }

            const calculations =
                data || [];

            const startOfToday =
                new Date();

            startOfToday.setHours(
                0,
                0,
                0,
                0
            );

            const sevenDaysAgo =
                new Date();

            sevenDaysAgo.setDate(
                sevenDaysAgo.getDate() - 7
            );

            const todayCount =
                calculations.filter(item =>
                    new Date(item.created_at) >=
                    startOfToday
                ).length;

            const recentCount =
                calculations.filter(item =>
                    new Date(item.created_at) >=
                    sevenDaysAgo
                ).length;

            return {

                total: calculations.length,

                today: todayCount,

                recent: recentCount,

                calculations

            };

        },


        async getRecent(limit = 7) {

            const user =
                await this.getCurrentUser();

            if (!user) {
                return [];
            }

            const {
                data,
                error
            } = await window.supabaseClient
                .from(TABLE)
                .select(
                    "id, expression, result, operation, created_at"
                )
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false
                })
                .limit(limit);

            if (error) {
                throw error;
            }

            return data || [];

        },


        async getChartData(days = 7) {

            const user =
                await this.getCurrentUser();

            if (!user) {
                return [];

            }

            const start =
                new Date();

            start.setDate(
                start.getDate() - days + 1
            );

            start.setHours(
                0,
                0,
                0,
                0
            );

            const {
                data,
                error
            } = await window.supabaseClient
                .from(TABLE)
                .select("created_at")
                .eq("user_id", user.id)
                .gte(
                    "created_at",
                    start.toISOString()
                )
                .order("created_at", {
                    ascending: true
                });

            if (error) {
                throw error;
            }

            const result = [];

            for (
                let i = 0;
                i < days;
                i++
            ) {

                const date =
                    new Date(start);

                date.setDate(
                    start.getDate() + i
                );

                const key =
                    date.toISOString()
                        .split("T")[0];

                result.push({

                    date: key,

                    count:
                        (data || []).filter(item =>
                            item.created_at
                                .startsWith(key)
                        ).length

                });

            }

            return result;

        },


        async getCurrentUser() {

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

