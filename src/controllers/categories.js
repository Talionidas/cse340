import {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    updateCategoryAssignments
} from '../models/categories.js';
import {
    getProjectsByCategoryId,
    getProjectDetails
} from '../models/projects.js';

const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;

        if (!/^[1-9]\d*$/.test(categoryId)) {
            const error = new Error('Invalid Category ID');
            error.status = 404;
            return next(error);
        }

        const category = await getCategoryDetails(categoryId);

        if (!category) {
            const error = new Error('Category Not Found');
            error.status = 404;
            return next(error);
        }

        const projects = await getProjectsByCategoryId(categoryId);
        const title = category.name;

        res.render('category', { title, category, projects });
    } catch (error) {
        next(error);
    }
};

const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        if (!/^[1-9]\d*$/.test(projectId)) {
            const error = new Error('Invalid Project ID');
            error.status = 404;
            return next(error);
        }

        const projectDetails = await getProjectDetails(projectId);

        if (!projectDetails) {
            const error = new Error('Project Not Found');
            error.status = 404;
            return next(error);
        }

        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByProjectId(projectId);
        const title = 'Assign Categories to Project';

        res.render('assign-categories', {
            title,
            projectId,
            projectDetails,
            categories,
            assignedCategories
        });
    } catch (error) {
        next(error);
    }
};

const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        if (!/^[1-9]\d*$/.test(projectId)) {
            const error = new Error('Invalid Project ID');
            error.status = 404;
            return next(error);
        }

        const projectDetails = await getProjectDetails(projectId);

        if (!projectDetails) {
            const error = new Error('Project Not Found');
            error.status = 404;
            return next(error);
        }

        const selectedCategoryIds = req.body?.categoryIds || [];
        const categoryIdsArray = Array.isArray(selectedCategoryIds)
            ? selectedCategoryIds
            : [selectedCategoryIds];

        const categories = await getAllCategories();
        const validCategoryIds = new Set(
            categories.map(category => String(category.category_id))
        );

        const hasInvalidCategory = categoryIdsArray.some(
            id => !validCategoryIds.has(String(id))
        );

        if (hasInvalidCategory) {
            req.flash('error', 'One or more selected categories are invalid.');
            return res.redirect(`/assign-categories/${projectId}`);
        }

        await updateCategoryAssignments(
            projectId,
            [...new Set(categoryIdsArray)]
        );

        req.flash('success', 'Categories updated successfully.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm
};
