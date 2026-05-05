import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateProfileDto, ChangePasswordDto, UpdateTutorialDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  findAll(
    @Query('role') role?: string,
    @Query('siteId') siteId?: string,
    @Query('actif') actif?: string,
  ) {
    return this.usersService.findAll({ role, siteId, actif });
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get('me')
  @Roles(Role.AGENT)
  getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @Roles(Role.AGENT)
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  @Roles(Role.AGENT)
  changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, dto);
  }

  @Patch('me/tutorial')
  @Roles(Role.AGENT)
  updateTutorial(
    @CurrentUser() user: any,
    @Body() dto: UpdateTutorialDto,
  ) {
    return this.usersService.updateTutorial(user.id, dto.tutorialCompleted);
  }

  @Patch(':id/desactiver')
  @Roles(Role.SUPER_ADMIN)
  desactiverUser(@Param('id') id: string) {
    return this.usersService.desactiverUser(id);
  }

  @Patch(':id/reactiver')
  @Roles(Role.SUPER_ADMIN)
  reactiverUser(@Param('id') id: string) {
    return this.usersService.reactiverUser(id);
  }

  @Patch(':id/reset-password')
  @Roles(Role.SUPER_ADMIN)
  resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }
}
