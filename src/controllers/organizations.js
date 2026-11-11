import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
};

const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;

        if (!/^[1-9]\d*$/.test(organizationId)) {
            const err = new Error('Invalid Organization ID');
            err.status = 400;
            return next(err);
        }

        const organizationDetails = await getOrganizationDetails(organizationId);

        if (!organizationDetails) {
            const err = new Error('Organization Not Found');
            err.status = 404;
            return next(err);
        }

        const projects = await getProjectsByOrganizationId(organizationId);
        const title = organizationDetails.name;

        res.render('organization', { title, organizationDetails, projects });
    } catch (error) {
        next(error);
    }
};

export { showOrganizationsPage, showOrganizationDetailsPage };
