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

## Development

#### Backend

NodeJS proxy w/Typescript and Express.js

### Frontend

* Client app: React
    * https://github.com/viaacode/avo2-client
* Admin app: React
    * https://github.com/viaacode/react-admin-core-module

run locally for development:
```shell
npm run dev
```

run production ssr build locally:
```shell
npm run start-with-env
```

run in docker locally like on cloud:
```shell
docker compose -f ./docker-compose.yml -p avo2-client up -d --build app
```

in the cloud the docker file is used with npm run start since the env vars are set by openshift
```shell
npm run start
```


## Logging and monitoring

#### Backend

https://github.com/viaacode/avo2-proxy

## Deployment/Installation

#### Prerequisites

#### Front-end

Jenkins builds a docker image and uploads it to the viaa docker registry.

## Usage

#### Examples

See postman collection (TODO add link)

### Troubleshooting

## Deploy to QAS

https://docs.google.com/document/d/16jZSM71yOikHB1kgtfKYaasz-gQkIVdG/edit

### Deploy to PROD

https://docs.google.com/document/d/1Nhj90tl0IbqTUSGvtPMO8ThhqWiXkm4N/edit

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
