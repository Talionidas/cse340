import {
    getUpcomingProjects,
    getProjectDetails,
    createProject,
    updateProject
} from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';
import { body, validationResult } from 'express-validator';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 })
        .withMessage('Location must be less than 200 characters'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601({ strict: true })
        .withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isInt({ min: 1 })
        .withMessage('Organization must be a valid integer')
];

const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        if (!/^[1-9]\d*$/.test(projectId)) {
            const error = new Error('Invalid Project ID');
            error.status = 404;
            return next(error);
        }

        const project = await getProjectDetails(projectId);

        if (!project) {
            const error = new Error('Project Not Found');
            error.status = 404;
            return next(error);
        }

        const categories = await getCategoriesByProjectId(projectId);
        const title = project.title;

        res.render('project', { title, project, categories });
    } catch (error) {
        next(error);
    }
};

const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';

        res.render('new-project', { title, organizations });
    } catch (error) {
        next(error);
    }
};

const processNewProjectForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-project');
        }

        const { title, description, location, date, organizationId } = req.body;

        const organizations = await getAllOrganizations();
        const organizationExists = organizations.some(
            org => String(org.organization_id) === String(organizationId)
        );

        if (!organizationExists) {
            req.flash('error', 'Please select a valid organization.');
            return res.redirect('/new-project');
        }

        const newProjectId = await createProject(
            title,
            description,
            location,
            date,
            organizationId
        );

        req.flash('success', 'New service project created successfully!');
        res.redirect(`/project/${newProjectId}`);
    } catch (error) {
        next(error);
    }
};

const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        if (!/^[1-9]\d*$/.test(projectId)) {
            const error = new Error('Invalid Project ID');
            error.status = 404;
            return next(error);
        }

        const project = await getProjectDetails(projectId);

        if (!project) {
            const error = new Error('Project Not Found');
            error.status = 404;
            return next(error);
        }

        const organizations = await getAllOrganizations();
        const title = 'Edit Service Project';

        res.render('edit-project', {
            title,
            project,
            organizations
        });
    } catch (error) {
        next(error);
    }
};

const processEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        if (!/^[1-9]\d*$/.test(projectId)) {
            const error = new Error('Invalid Project ID');
            error.status = 404;
            return next(error);
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-project/${projectId}`);
        }

        const { title, description, location, date, organizationId } = req.body;

        const organizations = await getAllOrganizations();
        const organizationExists = organizations.some(
            org => String(org.organization_id) === String(organizationId)
        );

        if (!organizationExists) {
            req.flash('error', 'Please select a valid organization.');
            return res.redirect(`/edit-project/${projectId}`);
        }

        await updateProject(
            projectId,
            title,
            description,
            location,
            date,
            organizationId
        );

        req.flash('success', 'Service project updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation
};
