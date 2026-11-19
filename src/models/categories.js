import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT category_id, name
        FROM public.category
        ORDER BY name;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getCategoryDetails = async (id) => {
    const query = `
        SELECT category_id, name
        FROM public.category
        WHERE category_id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name
        FROM public.category c
        JOIN public.project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
};

const assignCategoryToProject = async (projectId, categoryId, client = db) => {
    const query = `
        INSERT INTO public.project_category (project_id, category_id)
        VALUES ($1, $2);
    `;
    await client.query(query, [projectId, categoryId]);
};

const updateCategoryAssignments = async (projectId, categoryIds) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const deleteQuery = `
            DELETE FROM public.project_category
            WHERE project_id = $1;
        `;
        await client.query(deleteQuery, [projectId]);

        for (const categoryId of categoryIds) {
            await assignCategoryToProject(projectId, categoryId, client);
        }

        await client.query('COMMIT');

        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('Updated categories for project ID:', projectId);
        }
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    updateCategoryAssignments
};
