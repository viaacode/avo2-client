# Het Archief voor Onderwijs - client app

## Synopsis

This repository contains the React AVO Client app front-end for the end user.

## Technical

| Role            | Handle / username                                     |
|-----------------|-------------------------------------------------------|
| Principal/Owner | Bart Debunne <bart.debunne@viaa.be>                   |
| Lead Developer  | Enzo Eghermanne <enzo.eghermanne@studiohyperdrive.be> |
| Lead Developer  | Bert Verhelst <bert.verhelst@studiohyperdrive.be>     |
| Developer       | Benjamin Naesen <benjamin.naesen@studiohyperdrive.be> |
| Developer       | Andry Charlier <andry.charlier@studiohyperdrive.be>   |

**Code Review:**

## Functional

The React AVO Client app will provide the following:

* Implementation of the React @viaa/components in screens for the end user
* Coupling with the NodeJS proxy for authentication & search

## Server

|          | QAS  | PRD  |
|----------|:----:|:----:|
| **host** | TODO | TODO |

## Stack

#### Backend

NodeJS proxy w/Typescript and Express.js

### Frontend

* Client app: React
    * https://github.com/viaacode/avo2-client
* Admin app: React
    * https://github.com/viaacode/avo2-admin

## Logging and monitoring

#### Backend

// TODO

## Deployment/Installation

#### Prerequisites

#### Front-end

Jenkins builds a docker image and uploads it to the viaa docker registry.

## Usage

#### Examples

See postman collection (TODO add link)

### Troubleshooting

## Deploy to QAS

Steps to deploy:

* check the deploy steps script: https://meemoo.atlassian.net/wiki/spaces/AVO2/pages/3434807412/Draaiboek+releases
* follow the checklist: https://studiohyperdrive.slite.com/app/docs/l2drKQKtX

### Deploy to PROD

* check the deploy steps script: https://meemoo.atlassian.net/wiki/spaces/AVO2/pages/3434807412/Draaiboek+releases
* follow the checklist: https://studiohyperdrive.slite.com/app/docs/nKN5Wm7IZQ

### Troubleshoot deploy

If the deploy completes successfully but the version on the server doesn't seem to update,
this could be an issue with the image not automatically being selected by openshift

Steps:

* You can login to openshift
* Go to Deployments > avo2-client-qas
* Actions > edit at the top right
* Scroll down to Image Stream Tag and select the correct image in the dropdown on the right
* Save, wait for image to be deloyed

Note:

* the correct image should normally be the tag containing the environment name (eg: qas for qas environment)
* This image is automatically updated when a new deploy occurs
* When you select a different image than the env image, the auto updating behavior will not happen anymore

## Process Flow

#### Flow

#### Diagram
